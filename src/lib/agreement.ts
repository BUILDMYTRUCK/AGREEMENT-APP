// The legal text of the service agreement. Edit this in one place and it will
// be shown on screen AND embedded in every generated PDF.

export const SHOP_NAME = "Kwest Transport";

export const AGREEMENT_TITLE = "Vehicle Service Agreement";

export const AGREEMENT_CLAUSES: { heading: string; body: string }[] = [
  {
    heading: "1. Authorization to Diagnose and Perform Work",
    body: `By signing this agreement, the customer grants ${SHOP_NAME} permission to diagnose and/or perform work on the vehicle described below. This includes inspection, testing, and any reasonable procedures necessary to identify or verify the reported concerns and symptoms.`,
  },
  {
    heading: "2. Tear-Down and Incidental Damage",
    body: `The customer acknowledges that parts may need to be removed ("tear down") in order to verify concerns or symptoms. During normal inspection and tear-down, incidental items such as plastic clips, fasteners, hoses, rubber seals, or similar components may break or fail. ${SHOP_NAME} is NOT liable for breakage of such items that occurs as part of normal diagnostic or repair procedures.`,
  },
  {
    heading: "3. Diagnostic Time",
    body: `The customer agrees to authorize up to ONE (1) hour of diagnostic time by allowing ${SHOP_NAME} to look at the vehicle. At the end of that hour, an initial estimate will be prepared and presented to the customer for approval before any further work is performed.`,
  },
  {
    heading: "4. Parts Deposits",
    body: `Parts deposits may be required before any parts are ordered. All parts deposits are NON-REFUNDABLE once parts have been ordered on the customer's behalf.`,
  },
  {
    heading: "5. Storage Fees",
    body: `If the customer does not approve the vehicle to be repaired, OR if the vehicle is repaired but not picked up within SEVEN (7) days of notification that it is ready, storage fees will accrue at a rate of $59.00 per day, per vehicle.`,
  },
  {
    heading: "6. Abandonment",
    body: `After NINETY (90) days from the date of drop-off or the date the vehicle was ready for pickup (whichever is later), any vehicle or other property remaining at ${SHOP_NAME} will be considered ABANDONED and FORFEITED. Abandoned property is subject to sale or disposal by any legal means for removal, and the customer waives any further claim to such property.`,
  },
];
