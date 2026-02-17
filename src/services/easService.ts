
import { Attestation, Chain } from '../types';

interface GraphQLResponse {
  data: {
    attestations?: Array<{
      id: string;
      attester: string;
      recipient: string;
      time: number;
      decodedDataJson: string;
      schema: {
        id: string;
      };
    }>;
  };
  errors?: any[];
}

// 1. Fetch attestations received by a specific USER (Profile view)
export const fetchAttestations = async (address: string, chain: Chain): Promise<Attestation[]> => {
  if (!chain.graphqlUrl) return [];

  const query = `
    query UserAttestations($address: String!) {
      attestations(
        where: {
          recipient: { equals: $address }
          revoked: { equals: false }
        }
        orderBy: { time: desc }
        take: 20
      ) {
        id
        attester
        recipient
        time
        decodedDataJson
        schema {
          id
        }
      }
    }
  `;

  try {
    return await executeQuery(chain, query, { address });
  } catch (error) {
    console.warn(`Fetch error on ${chain.name}:`, error);
    return [];
  }
};

// 2. Fetch recent attestations for a specific SCHEMA (Leaderboard/Activity view)
export const fetchRecentAttestations = async (schemaUid: string, chain: Chain): Promise<Attestation[]> => {
  if (!chain.graphqlUrl) return [];

  // FIXED: Using String! matches EAS Scan schema better than Bytes!
  const query = `
    query SchemaAttestations($schemaUid: String!) {
      attestations(
        where: {
          schemaId: { equals: $schemaUid }
          revoked: { equals: false }
        }
        orderBy: { time: desc }
        take: 10
      ) {
        id
        attester
        recipient
        time
        decodedDataJson
        schema {
          id
        }
      }
    }
  `;

  try {
    return await executeQuery(chain, query, { schemaUid: schemaUid });
  } catch (error) {
    console.error(`Recent fetch error on ${chain.name}:`, error);
    return [];
  }
}

// Helper function to handle the fetch logic and PARSE DATA nicely
const executeQuery = async (chain: Chain, query: string, variables: any): Promise<Attestation[]> => {
    const response = await fetch(chain.graphqlUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
        // Log status to help debug if needed, but return empty to not break UI
        // console.warn(`GraphQL Error ${response.status} on ${chain.name}`);
        return [];
    }

    const json: GraphQLResponse = await response.json();
    if (!json.data || !json.data.attestations) return [];

    return json.data.attestations.map((att: any) => {
        let displayData = "Verified On-Chain";
        
        // Parsing Logic: Extract meaningful data from the JSON string
        try {
            if (att.decodedDataJson) {
                const parsed = JSON.parse(att.decodedDataJson);
                if (Array.isArray(parsed) && parsed.length > 0) {
                     // Prioritize showing 'score', 'id', 'rank', or 'level'
                     const meaningful = parsed.find((p: any) => {
                        const name = p.name.toLowerCase();
                        return name.includes('score') || name.includes('id') || name.includes('rank') || name.includes('tier');
                     });

                     if (meaningful) {
                        // Clean up values
                        let val = meaningful.value.value;
                        if (typeof val === 'object' && val.hex) val = parseInt(val.hex, 16); // Handle BigInt hex
                        displayData = `${meaningful.name}: ${val}`;
                     } else {
                        // Fallback: just show the names of the fields
                        displayData = parsed.map((p: any) => p.name).slice(0, 2).join(', ');
                     }
                }
            }
        } catch (e) {
            // displayData remains "Verified On-Chain" if parsing fails
        }

        return {
            uid: att.id,
            schemaUid: att.schema?.id || 'unknown',
            recipient: att.recipient,
            attester: att.attester,
            time: att.time,
            data: displayData,
            schemaName: 'Unknown Schema', 
            provider: 'Unknown Provider', 
            network: chain.name,
            networkColor: chain.color,
            networkLogo: chain.logoUrl 
        };
    });
}

export const fetchSchemaDetails = async () => { return null; };
