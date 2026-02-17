
import { Attestation, Chain } from '../types';

interface VeraxGraphQLResponse {
  data: {
    attestations?: Array<{
      id: string;
      attester: string;
      subject: string; // Verax uses 'subject' instead of 'recipient'
      attestedDate: number; // Verax uses 'attestedDate'
      decodedData: string; // Verax usually exposes decoded data
      schema: {
        id: string;
      };
    }>;
  };
  errors?: any[];
}

export const fetchVeraxAttestations = async (address: string, chain: Chain): Promise<Attestation[]> => {
  if (!chain.graphqlUrl) return [];

  const query = `
    query UserAttestations($address: Bytes!) {
      attestations(
        where: {
          subject: $address
          revoked: false
        }
        orderBy: attestedDate
        orderDirection: desc
        first: 10
      ) {
        id
        attester
        subject
        attestedDate
        decodedData
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
      body: JSON.stringify({ query, variables: { address: address.toLowerCase() } }),
    });

    if (!response.ok) return [];

    const json: VeraxGraphQLResponse = await response.json();
    if (!json.data || !json.data.attestations) return [];

    return json.data.attestations.map((att: any) => {
        return {
            uid: att.id,
            schemaUid: att.schema?.id || 'unknown',
            recipient: att.subject,
            attester: att.attester,
            time: att.attestedDate,
            data: "Soulbound Verax ID", // Simplification
            schemaName: 'Linea Verax ID', 
            provider: 'Linea Portal', 
            network: chain.name,
            networkColor: chain.color,
            networkLogo: chain.logoUrl 
        };
    });

  } catch (error) {
    console.warn("Verax fetch failed:", error);
    return [];
  }
};

export const fetchRecentVeraxAttestations = async (schemaId: string, chain: Chain): Promise<Attestation[]> => {
    if (!chain.graphqlUrl) return [];
  
    const query = `
      query RecentAttestations($schemaId: Bytes!) {
        attestations(
          where: {
            schema: $schemaId
            revoked: false
          }
          orderBy: attestedDate
          orderDirection: desc
          first: 5
        ) {
          id
          attester
          subject
          attestedDate
          decodedData
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
        body: JSON.stringify({ query, variables: { schemaId: schemaId } }),
      });
  
      const json: VeraxGraphQLResponse = await response.json();
      if (!json.data || !json.data.attestations) return [];
  
      return json.data.attestations.map((att: any) => ({
          uid: att.id,
          schemaUid: att.schema?.id || 'unknown',
          recipient: att.subject,
          attester: att.attester,
          time: att.attestedDate,
          data: "SBT Minted",
          schemaName: 'Linea Soulbound', 
          provider: 'Linea', 
          network: chain.name,
          networkColor: chain.color,
          networkLogo: chain.logoUrl 
      }));
    } catch (e) {
        return [];
    }
}
