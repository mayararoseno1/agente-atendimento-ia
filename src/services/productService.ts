
export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export type ProductResult =
  | { success: true; product: Product }
  | {
      success: false;
      reason: "NOT_FOUND" | "EXTERNAL_API_ERROR";
    };

export async function getProductById(
  id: number
): Promise<ProductResult> {
  try {
    const response = await fetch(
      `https://fakestoreapi.com/products/${id}`,
      {
        signal: AbortSignal.timeout(5000),
      }
    );

    if (response.status === 404) {
      return { success: false, reason: "NOT_FOUND" };
    }

    if (!response.ok) {
      return { success: false, reason: "EXTERNAL_API_ERROR" };
    }

    const data: unknown = await response.json();

    if (
      typeof data !== "object" ||
      data === null ||
      !("id" in data) ||
      !("title" in data) ||
      !("price" in data) ||
      !("description" in data) ||
      !("category" in data) ||
      !("image" in data) ||
      typeof data.id !== "number" ||
      typeof data.title !== "string" ||
      typeof data.price !== "number" ||
      typeof data.description !== "string" ||
      typeof data.category !== "string" ||
      typeof data.image !== "string"
    ) {
      return { success: false, reason: "EXTERNAL_API_ERROR" };
    }

    if (data.id !== id) {
      return { success: false, reason: "EXTERNAL_API_ERROR" };
    }

    return {
      success: true,
      product: {
        id: data.id,
        title: data.title,
        price: data.price,
        description: data.description,
        category: data.category,
        image: data.image,
      },
    };
  } catch {
    return { success: false, reason: "EXTERNAL_API_ERROR" };
  }
}
