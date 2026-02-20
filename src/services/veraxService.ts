
import { Attestation, Chain } from '../types';

interface VeraxResponse {
  data: {
    attestations?: Array<{
      id: string;
      attester: string;
      subject: string;
      attestationDate: string;
      decodedData: string[];
      schema: {
        id: string;
      };
    }>;
  };
}

export const fetchVeraxAttestations = async (address: string, chain: Chain): Promise<Attestation[]> => {
  if (!chain.graphqlUrl || !chain.name.toLowerCase().includes('linea')) return [];

  const query = `
    query UserAttestations($address: String!) {
      attestations(
        where: {
          subject: $address
        }
        orderBy: attestationDate,
        orderDirection: desc,
        first: 20
      ) {
        id
        attester
        subject
        attestationDate
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
      body: JSON.stringify({ 
        query, 
        variables: { address: address.toLowerCase() } 
      }),
    });

    if (!response.ok) return [];

    const json: VeraxResponse = await response.json();
    if (!json.data || !json.data.attestations) return [];

    return json.data.attestations.map((att) => ({
      uid: att.id,
      schemaUid: att.schema?.id || 'unknown',
      recipient: att.subject,
      attester: att.attester,
      time: parseInt(att.attestationDate),
      data: att.decodedData && att.decodedData.length > 0 ? att.decodedData.join(', ') : "Verax Attestation",
      schemaName: 'Verax Schema',
      provider: 'Verax',
      network: chain.name,
      networkColor: chain.color,
      networkLogo: chain.logoUrl
    }));
  } catch (error) {
    console.warn("Verax fetch error:", error);
    return [];
  }
};
