// @ts-check
// src/frontend/worker.js

self.onmessage = function (event) {
  const { type, data, buffers: inputBuffers } = event.data;

  if (type === 'serialize') {
    try {
      const buffers = [];
      const json = JSON.stringify(data, (key, value) => {
        if (value && ArrayBuffer.isView(value) && !(value instanceof DataView)) {
            buffers.push(value.buffer); // Store the underlying buffer
            return {
                __type: 'TypedArray',
                id: buffers.length - 1,
                ctor: value.constructor.name,
                byteOffset: value.byteOffset,
                length: value.length
            };
        }
        return value;
      });

      self.postMessage({
          type: 'serialize_complete',
          data: json,
          buffers: buffers // Pass the array of buffers
      }, buffers); // Transfer ownership

    } catch (error) {
      self.postMessage({ type: 'error', message: 'Serialization failed', error: error.message });
    }
  } else if (type === 'deserialize') {
    try {
      const reconstructed = JSON.parse(data, (key, value) => {
          if (value && value.__type === 'TypedArray' && typeof value.id === 'number') {
              const buffer = inputBuffers && inputBuffers[value.id];
              if (!buffer) return value; // Fallback or error?

              const Ctor = self[value.ctor] || Float32Array;

              if (buffer instanceof ArrayBuffer) {
                  return new Ctor(buffer, value.byteOffset, value.length);
              }
              return buffer;
          }
          return value;
      });

      self.postMessage({ type: 'deserialize_complete', data: reconstructed });

    } catch (error) {
        self.postMessage({ type: 'error', message: 'Deserialization failed', error: error.message });
    }
  }
};
