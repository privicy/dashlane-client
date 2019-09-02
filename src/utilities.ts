import { inflateSync } from "zlib";
import { xml2js } from "xml-js";
import { KWVaultItem, KWField, RawEntry, Entry } from "./types";
import { BASE_URL } from "./config";

export const request = async (
  endpoint: string,
  body?: any,
  headers?: any,
  parse: boolean = true
) => {
  const form = new FormData();
  body &&
    Object.keys(body).map(key => {
      form.append(key, body[key]);
    });
  const response = await fetch(BASE_URL + endpoint, {
    method: "POST",
    body: form,
    headers: {
      ...(headers && headers),
      "x-requested-with": "MAC"
    }
  });
  return parse ? await response.json() : response.text();
};

export const uncompress = async (data: Buffer): Promise<string> => {
  const inflate = inflateSync(data);
  return Buffer.from(inflate.toString()).toString();
};

export const transformItem = (item: string): Entry => {
  const { root } = xml2js(item, { compact: true }) as KWVaultItem;
  const rawEntry = root.KWAuthentifiant.KWDataItem.reduce(
    (acc: Partial<RawEntry>, value: KWField) => {
      acc[value._attributes.key] = value._cdata;
      return acc;
    },
    {}
  ) as RawEntry;

  return {
    name: rawEntry.Title,
    username: rawEntry.Email,
    url: rawEntry.Url,
    password: rawEntry.Password,
    type: rawEntry.Category,
    otp: undefined
  };
};
