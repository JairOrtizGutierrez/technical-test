export const fetchData = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  const json: Promise<T> = await response.json();
  return json;
};

