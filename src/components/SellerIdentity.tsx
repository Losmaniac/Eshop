import { settings } from "@/content/settings";
import { Placeholder } from "./LegalPage";

/** Seller name, IČO and address, with placeholders until filled in settings.ts. */
export function SellerIdentity() {
  const { seller } = settings;
  return (
    <>
      {seller.name || <Placeholder>název / jméno prodávajícího</Placeholder>}, IČO{" "}
      {seller.ico || <Placeholder>IČO</Placeholder>}, se sídlem {seller.address || <Placeholder>adresa</Placeholder>}
      {seller.dic && <>, DIČ {seller.dic}</>}
    </>
  );
}

export function SellerContact() {
  const { seller } = settings;
  return (
    <>
      e-mail {seller.email || <Placeholder>e-mail</Placeholder>}, telefon {seller.phone || <Placeholder>telefon</Placeholder>}
    </>
  );
}
