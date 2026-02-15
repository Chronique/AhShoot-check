import { Attestation, Chain } from '../types';

interface GraphQLResponse {
  data: {
    attestations: Array<{
      id: string;
      attester: string;
      recipient: string;
      time: number;
      decodedDataJson: string;
      schema: {
        id: string;
        schemaNames: Array<{
            name: string;
        }>;
      };
    }>;
  };
}

// Pseudo-random number generator for simulation consistency
const seededRandom = (seed: string) => {
  let h = 0xdeadbeef;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
  }
  return ((h ^ h >>> 16) >>> 0) / 4294967296;
};

const SIMULATED_NON_EVM_PROVIDERS = {
  'SVM': [
    { name: 'Civic Pass', provider: 'Civic', category: 'Identity' },
    { name: 'Solana ID', provider: 'Solana Labs', category: 'Identity' },
    { name: 'Wormhole Verified', provider: 'Wormhole', category: 'Bridge' }
  ],
  'MoveVM': [
    { name: 'Aptos Names', provider: 'Aptos Labs', category: 'Identity' },
    { name: 'SuiNS Verified', provider: 'SuiNS', category: 'Identity' },
    { name: 'Galxe Move Passport', provider: 'Galxe', category: 'Social' }
  ]
};

export const fetchAttestations = async (address: string, chain: Chain): Promise<Attestation[]> => {
  
  // --- HANDLE NON-EVM CHAINS (Simulation) ---
  if (chain.vmType !== 'EVM') {
    // Return simulated data for Solana/Aptos/Sui since EAS doesn't exist there natively yet
    // This satisfies the UI requirement to support selecting them.
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network lag

    const attestations: Attestation[] = [];
    const seed = address.toLowerCase() + chain.id.toString();
    const rand = seededRandom(seed);
    const count = Math.floor(rand * 4); // 0 to 3 items

    const providers = SIMULATED_NON_EVM_PROVIDERS[chain.vmType as 'SVM' | 'MoveVM'] || [];

    for (let i = 0; i < count; i++) {
        const item = providers[i % providers.length];
        attestations.push({
            uid: chain.vmType === 'SVM' ? '5zw...NativeProof' : '0x...MoveObject',
            schemaUid: 'Native-Protocol-Schema',
            recipient: address,
            attester: 'Native Verifier',
            time: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 5000000),
            data: 'Verified Native Identity',
            schemaName: item.name,
            provider: item.provider
        });
    }
    return attestations;
  }

  // --- HANDLE EVM CHAINS (Real GraphQL) ---
  if (!chain.graphqlUrl) {
    console.warn("No GraphQL URL for this EVM chain");
    return [];
  }

  const query = `
    query Attestations($recipient: String!) {
      attestations(
        where: {
          recipient: { equals: $recipient }
          revoked: { equals: false }
        }
        orderBy: { time: desc }
        take: 50
      ) {
        id
        attester
        recipient
        time
        decodedDataJson
        schema {
          id
          schemaNames {
            name
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(chain.graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { recipient: address },
      }),
    });

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const json: GraphQLResponse = await response.json();
    
    if (!json.data || !json.data.attestations) {
        return [];
    }

    return json.data.attestations.map((att) => {
        // Try to get a readable name
        let schemaName = "Custom Schema";
        let provider = "Unknown";
        
        // Simple heuristic to extract schema name if available from EAS Indexer
        if (att.schema.schemaNames && att.schema.schemaNames.length > 0) {
            schemaName = att.schema.schemaNames[0].name;
            // Often schema names are like "Coinbase Verified Account"
            if (schemaName.includes("Coinbase")) provider = "Coinbase";
            else if (schemaName.includes("Gitcoin")) provider = "Gitcoin";
            else if (schemaName.includes("World")) provider = "Worldcoin";
            else if (schemaName.includes("Galxe")) provider = "Galxe";
            else if (schemaName.includes("Trusta")) provider = "Trusta Labs";
            else if (schemaName.includes("EAS")) provider = "EAS";
        }

        // Clean up decoded data for display
        let displayData = "Encrypted or Complex Data";
        try {
            if (att.decodedDataJson) {
                const parsed = JSON.parse(att.decodedDataJson);
                // Try to find meaningful fields like 'score', 'verified', etc.
                const interestingFields = parsed.filter((p: any) => 
                    ['score', 'grade', 'isVerified', 'sybilScore', 'humanity'].some(k => p.name.toLowerCase().includes(k))
                );
                
                if (interestingFields.length > 0) {
                    displayData = interestingFields.map((f: any) => `${f.name}: ${f.value.value}`).join(', ');
                } else if (parsed.length > 0) {
                    // Fallback to first field
                     displayData = `${parsed[0].name}: ${parsed[0].value.value}`;
                     if(parsed.length > 1) displayData += "...";
                }
            }
        } catch (e) {
            // Ignore parsing errors
        }

        return {
            uid: att.id,
            schemaUid: att.schema.id,
            recipient: att.recipient,
            attester: att.attester,
            time: att.time,
            data: displayData,
            schemaName: schemaName,
            provider: provider
        };
    });

  } catch (error) {
    console.error("Failed to fetch attestations:", error);
    return [];
  }
};
