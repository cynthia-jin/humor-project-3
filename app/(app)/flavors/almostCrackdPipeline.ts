const ALMOST_CRACKD_BASE_URL = "https://api.almostcrackd.ai";

export async function almostCrackdReadError(res: Response) {
  const text = await res.text();
  if (!text) return `${res.status} ${res.statusText}`;
  try {
    const json: unknown = JSON.parse(text);
    if (json && typeof json === "object") {
      const obj = json as Record<string, unknown>;
      const message =
        obj.message ?? obj.error ?? obj.detail ?? obj?.toString;
      if (typeof message === "string" && message.trim()) {
        return `${res.status} ${message}`;
      }
    } else if (typeof json === "string" && json.trim()) {
      return `${res.status} ${json}`;
    }
  } catch {
    // Ignore JSON parsing failures.
  }
  return `${res.status} ${res.statusText}: ${text}`;
}

export async function generatePresignedUploadUrl(params: {
  token: string;
  contentType: string;
}): Promise<{ presignedUrl: string; cdnUrl: string }> {
  const res = await fetch(
    `${ALMOST_CRACKD_BASE_URL}/pipeline/generate-presigned-url`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contentType: params.contentType }),
    }
  );

  if (!res.ok) {
    throw new Error(await almostCrackdReadError(res));
  }

  const data = (await res.json()) as {
    presignedUrl: string;
    cdnUrl: string;
  };
  return data;
}

export async function uploadImageToPresignedUrl(params: {
  presignedUrl: string;
  file: File;
}) {
  const res = await fetch(params.presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": params.file.type,
    },
    body: params.file,
  });

  if (!res.ok) {
    throw new Error(await almostCrackdReadError(res));
  }
}

export async function uploadImageFromUrl(params: {
  token: string;
  imageUrl: string;
  isCommonUse: boolean;
}): Promise<{ imageId: string }> {
  const res = await fetch(
    `${ALMOST_CRACKD_BASE_URL}/pipeline/upload-image-from-url`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl: params.imageUrl,
        isCommonUse: params.isCommonUse,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(await almostCrackdReadError(res));
  }

  const data = (await res.json()) as { imageId: string; now?: number };
  return data;
}

export async function generateCaptionsForFlavor(params: {
  token: string;
  imageId: string;
  humorFlavorId: string;
}): Promise<unknown[]> {
  const res = await fetch(
    `${ALMOST_CRACKD_BASE_URL}/pipeline/generate-captions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageId: params.imageId,
        humorFlavorId: params.humorFlavorId,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(await almostCrackdReadError(res));
  }

  const data: unknown = await res.json();
  if (Array.isArray(data)) return data;
  return [data];
}

