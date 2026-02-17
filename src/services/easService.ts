
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
    query Attestations($address: String!) {
      attestations(
        where: {
          recipient: { equals: $address }
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
    return await executeQuery(chain, query, { address });
  } catch (error) {
    return [];
  }
};

// 2. Fetch recent attestations for a specific SCHEMA (Leaderboard/Activity view)
export const fetchRecentAttestations = async (schemaUid: string, chain: Chain): Promise<Attestation[]> => {
  if (!chain.graphqlUrl) return [];

  const query = `
    query SchemaAttestations($schemaUid: StringString!) {
      attestations(
        where: {
          schemaId: { equals: $schemaUid }
          revoked: { equals: false }
        }
        orderBy: { time: desc }
        take: 5
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
    // Note: EAS GraphQL expects Schema UID in exact format used in DB (usually lowercase or mixed)
    return await executeQuery(chain, query, { schemaUid: schemaUid });
  } catch (error) {
    console.error("Failed to fetch recent activity:", error);
    return [];
  }
}

// Helper function to handle the fetch logic
const executeQuery = async (chain: Chain, query: string, variables: any): Promise<Attestation[]> => {
    const response = await fetch(chain.graphqlUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) return [];

    const json: GraphQLResponse = await response.json();
    if (!json.data || !json.data.attestations) return [];

    return json.data.attestations.map((att: any) => {
        let displayData = "Verified On-Chain";
        
        try {
            if (att.decodedDataJson) {
                const parsed = JSON.parse(att.decodedDataJson);
                if (Array.isArray(parsed) && parsed.length > 0) {
                     const meaningful = parsed.find((p: any) => p.name.toLowerCase().includes('score') || p.name.toLowerCase().includes('id'));
                     if (meaningful) {
                        displayData = `${meaningful.name}: ${meaningful.value.value}`;
                     } else {
                        displayData = parsed.map((p: any) => `${p.name}`).join(', ');
                     }
                }
            }
        } catch (e) {}

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
