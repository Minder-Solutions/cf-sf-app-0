import { json } from "@remix-run/cloudflare";

export async function loader() {
  const response: any = {
    kvStatus: "unknown"
  };

  if (typeof globalThis.shopifyKvNamespace !== 'undefined') {
    response.kvStatus = "initialized";
    response.hasGetMethod = typeof globalThis.shopifyKvNamespace.get === 'function';
    
    try {
      // Try to read a test value to confirm the KV is working
      const testValue = await globalThis.shopifyKvNamespace.get("test-key");
      response.testReadResult = testValue === null ? "key not found (expected)" : testValue;
      
      // Try to write a test value
      await globalThis.shopifyKvNamespace.put("test-key", "test-value-" + new Date().toISOString());
      response.testWriteResult = "success";
      
      // Read it back
      const verifyValue = await globalThis.shopifyKvNamespace.get("test-key");
      response.testVerifyResult = verifyValue;
    } catch (error) {
      response.error = error instanceof Error ? error.message : String(error);
    }
  } else {
    response.kvStatus = "not initialized";
  }
  
  if (typeof globalThis.shopifyAppInstance !== 'undefined') {
    response.appStatus = "initialized";
    
    // Check if session storage is accessible
    if (globalThis.shopifyAppInstance.sessionStorage) {
      response.sessionStorageStatus = "accessible";
      
      // Check if the namespace is set on session storage
      const sessionStorage = globalThis.shopifyAppInstance.sessionStorage;
      response.sessionStorageHasNamespace = !!(sessionStorage as any)._namespace;
    } else {
      response.sessionStorageStatus = "not accessible";
    }
  } else {
    response.appStatus = "not initialized";
  }
  
  return json(response);
}

export default function DiagnosticRoute() {
  return (
    <div>
      <h1>KV Diagnostic</h1>
      <p>Check the response data for KV namespace status.</p>
    </div>
  );
}
