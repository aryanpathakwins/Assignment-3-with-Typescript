type ValueType = string | number;

export default interface CardType {
  postalCode: ValueType;
  id: string;
  title: string;
  description?: string;
  price: number;
  quantity: number;
  availabilityFrom?: string;
  availabilityTo?: string;
  image?: string;

  // 🏠 Structured Address Fields
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}
