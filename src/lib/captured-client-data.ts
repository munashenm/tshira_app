export function buildCapturedClientFields(caseData?: any, clientData?: any) {
  return {
    clientName: caseData?.clientName || clientData?.name || "",
    idNumber: clientData?.idNumber || "",
    phone: clientData?.phone || "",
    email: clientData?.email || "",
    address: clientData?.address || "",
    businessName: clientData?.companyName || clientData?.tradingName || "",
    voucherNumber: caseData?.voucherAppNumber || caseData?.nydaReference || "",
    serviceRequired: caseData?.outputType?.replace(/_/g, " ") || "",
    province: caseData?.province?.replace(/_/g, " ") || "",
    district: clientData?.district || "",
    municipality: clientData?.municipality || "",
  };
}
