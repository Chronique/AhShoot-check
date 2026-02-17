
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
    const response = await fetch(chain.graphqlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { address: address } }),
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
                     // Try to find a meaningful value to display
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
            schemaName: 'Unknown Schema', // Filled later in App.tsx if matched
            provider: 'Unknown Provider', // Filled later in App.tsx if matched
            network: chain.name,
            networkColor: chain.color,
            networkLogo: chain.logoUrl 
        };
    });

  } catch (error) {
    // console.warn(`Failed to fetch from ${chain.name}:`, error);
    // Return empty so Promise.all in App.tsx continues
    return [];
  }
};

export const fetchSchemaDetails = async () => { return null; };
