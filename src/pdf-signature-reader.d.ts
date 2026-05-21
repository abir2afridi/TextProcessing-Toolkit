declare module "pdf-signature-reader" {
  export interface ValidationData {
    authenticity: boolean;
    integrity: boolean;
  }

  export interface CertificateIssuer {
    commonName?: string;
    organizationalUnitName?: string;
    organizationName?: string;
    countryName?: string;
    localityName?: string;
    stateOrProvinceName?: string;
  }

  export interface CertificateSubject {
    commonName?: string;
    serialNumber?: string;
    organizationalUnitName?: string;
    organizationName?: string;
    countryName?: string;
    localityName?: string;
    stateOrProvinceName?: string;
  }

  export interface ValidityPeriod {
    notBefore: string;
    notAfter: string;
  }

  export interface Certificate {
    clientCertificate?: boolean;
    issuedBy: CertificateIssuer;
    issuedTo: CertificateSubject;
    validityPeriod: ValidityPeriod;
    pemCertificate: string;
  }

  export interface SignatureMeta {
    reason: string;
    contactInfo: string | null;
    location: string;
    name: string | null;
  }

  export interface Signature {
    verified: boolean;
    authenticity: boolean;
    integrity: boolean;
    expired: boolean;
    meta: {
      certs: Certificate[];
      signatureMeta: SignatureMeta;
    };
  }

  export interface VerifyPDFResult {
    signatures: Signature[];
  }

  export default function verifyPDF(data: ArrayBuffer): VerifyPDFResult;
}
