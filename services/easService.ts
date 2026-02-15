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

const SIMULATED_PROVIDERS: Record<string, Array<{name: string, provider: string, category: string}>> = {
  'SVM': [
    { name: 'Civic Pass', provider: 'Civic', category: 'Identity' },
    { name: 'Solana ID', provider: 'Solana Labs', category: 'Identity' },
    { name: 'Wormhole Verified', provider: 'Wormhole', category: 'Bridge' }
  ],
  'MoveVM': [
    { name: 'Aptos Names', provider: 'Aptos Labs', category: 'Identity' },
    { name: 'SuiNS Verified', provider: 'SuiNS', category: 'Identity' },
    { name: 'Galxe Move Passport', provider: 'Galxe', category: 'Social' }
  ],
  'EVM': [
    { name: 'Testnet Identity', provider: 'Verax', category: 'Identity' },
    { name: 'Early Adopter', provider: 'Protocol DAO', category: 'Social' },
    { name: 'Faucet User', provider: 'Superchain', category: 'DeFi' },
    { name: 'Clique Beta Score', provider: 'Clique', category: 'DeFi' }
  ]
};

export const fetchAttestations = async (address: string, chain: Chain): Promise<Attestation[]> => {
  
  // --- SIMULATION LOGIC ---
  // If the chain is non-EVM OR it's an EVM chain without a configured GraphQL URL (e.g. new testnets),
  // we simulate data so the UI remains functional for demos.
  const shouldSimulate = !chain.graphqlUrl || chain.vmType !== 'EVM';

  if (shouldSimulate) {
    await new Promise(resolve => setTimeout(resolve, 300)); // Lower latency for aggregated fetching

    const attestations: Attestation[] = [];
    const seed = address.toLowerCase() + chain.id.toString();
    const rand = seededRandom(seed);
    const count = Math.floor(rand * 3); // 0 to 2 items per simulated chain

    const providers = SIMULATED_PROVIDERS[chain.vmType] || SIMULATED_PROVIDERS['EVM'];

    for (let i = 0; i < count; i++) {
        const item = providers[i % providers.length];
        // Create a fake UID based on vmType
        const uidPrefix = chain.vmType === 'SVM' ? '5zw' : (chain.vmType === 'MoveVM' ? '0xMove' : '0x');
        
        attestations.push({
            uid: `${uidPrefix}${Math.random().toString(16).slice(2)}...`,
            schemaUid: '0x0000000000000000000000000000000000000000000000000000000000000000',
            recipient: address,
            attester: '0x0000000000000000000000000000000000000000',
            time: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 5000000),
            data: 'Verified Testnet Credential',
            schemaName: item.name,
            provider: item.provider,
            network: chain.name,
            networkColor: chain.color
        });
    }
    return attestations;
  }

  // --- REAL DATA FETCHING (EVM) ---
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
    const response = await fetch(chain.graphqlUrl!, {
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
        console.warn(`Fetch error for ${chain.name}: ${response.statusText}`);
        return [];
    }

    const json: GraphQLResponse = await response.json();
    
    if (!json.data || !json.data.attestations) {
        return [];
    }

    return json.data.attestations.map((att) => {
        let schemaName = "Custom Schema";
        let provider = "Unknown";
        
        // Use Optional Chaining (?.) to prevent crash if schema is missing
        if (att.schema?.schemaNames && att.schema.schemaNames.length > 0) {
            schemaName = att.schema.schemaNames[0].name;
            if (schemaName.includes("Coinbase")) provider = "Coinbase";
            else if (schemaName.includes("Gitcoin")) provider = "Gitcoin";
            else if (schemaName.includes("World")) provider = "Worldcoin";
            else if (schemaName.includes("Galxe")) provider = "Galxe";
            else if (schemaName.includes("Trusta")) provider = "Trusta Labs";
            else if (schemaName.includes("EAS")) provider = "EAS";
            else if (schemaName.includes("Clique")) provider = "Clique";
        }

        let displayData = "Encrypted or Complex Data";
        try {
            if (att.decodedDataJson) {
                const parsed = JSON.parse(att.decodedDataJson);
                
                // Ensure parsed is an array before filtering
                const interestingFields = Array.isArray(parsed) ? parsed.filter((p: any) => 
                    ['score', 'grade', 'isVerified', 'sybilScore', 'humanity', 'rank'].some((k: string) => p.name.toLowerCase().includes(k))
                ) : [];
                
                if (interestingFields.length > 0) {
                    displayData = interestingFields.map((f: any) => {
                        const val = typeof f.value.value === 'object' ? JSON.stringify(f.value.value) : f.value.value;
                        return `${f.name}: ${val}`;
                    }).join(', ');
                } else if (Array.isArray(parsed) && parsed.length > 0) {
                     const val = typeof parsed[0].value.value === 'object' ? 'Object' : parsed[0].value.value;
                     displayData = `${parsed[0].name}: ${val}`;
                     if(parsed.length > 1) displayData += "...";
                }
            }
        } catch (e) {
            // Ignore parsing errors
        }

        return {
            uid: att.id,
            // Safe access for schema ID
            schemaUid: att.schema?.id || 'unknown',
            recipient: att.recipient,
            attester: att.attester,
            time: att.time,
            data: displayData,
            schemaName: schemaName,
            provider: provider,
            network: chain.name,
            networkColor: chain.color
        };
    });

  } catch (error) {
    // Fail silently in aggregated view to not break other chains
    console.warn(`Failed to fetch attestations from ${chain.name}:`, error);
    return [];
  }
};