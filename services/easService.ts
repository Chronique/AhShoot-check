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

export const fetchAttestations = async (address: string, chain: Chain): Promise<Attestation[]> => {
  
  // STRICT REAL DATA POLICY
  // The user requested to remove all dummy/simulated data.
  // We only fetch if a valid GraphQL URL is present.
  if (!chain.graphqlUrl) {
    return [];
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
        console.warn(`Fetch error for ${chain.name}: ${response.statusText}`);
        return [];
    }

    const json: GraphQLResponse = await response.json();
    
    if (!json.data || !json.data.attestations) {
        return [];
    }

    return json.data.attestations.map((att: any) => {
        let schemaName = "Custom Schema";
        let provider = "Unknown";
        
        // Use Optional Chaining (?.) to prevent crash if schema is missing
        if (att.schema?.schemaNames && att.schema.schemaNames.length > 0) {
            schemaName = att.schema.schemaNames[0].name;
            const lowerName = schemaName.toLowerCase();

            // --- REAL WORLD PROVIDER DETECTION ---
            if (lowerName.includes("coinbase")) provider = "Coinbase";
            else if (lowerName.includes("gitcoin")) provider = "Gitcoin";
            else if (lowerName.includes("world")) provider = "Worldcoin";
            else if (lowerName.includes("galxe")) provider = "Galxe";
            else if (lowerName.includes("trusta")) provider = "Trusta Labs";
            else if (lowerName.includes("eas")) provider = "EAS";
            else if (lowerName.includes("clique")) provider = "Clique";
            else if (lowerName.includes("farcaster") || lowerName.includes("fid")) provider = "Farcaster";
            else if (lowerName.includes("blackbird")) provider = "Blackbird";
            else if (lowerName.includes("guild")) provider = "Guild.xyz";
            else if (lowerName.includes("jokerace")) provider = "Jokerace";
            else if (lowerName.includes("optimism") || lowerName.includes("retropgf")) provider = "Optimism";
            else if (lowerName.includes("base")) provider = "Base";
        }

        let displayData = "Encrypted or Complex Data";
        try {
            if (att.decodedDataJson) {
                const parsed = JSON.parse(att.decodedDataJson);
                
                // Ensure parsed is an array before filtering
                const interestingFields = Array.isArray(parsed) ? parsed.filter((p: any) => 
                    ['score', 'grade', 'isverified', 'sybilscore', 'humanity', 'rank', 'role', 'name', 'membership'].some((k: string) => p.name.toLowerCase().includes(k))
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