import { useState, useCallback, useRef, useEffect } from "react";
import { useNotifications } from "../contexts/NotificationContext";

/**
 * Hook personalizado para manejar operaciones API de manera sencilla
 * Proporciona estados de loading, error y success, así como helpers para notificaciones
 */
export const useApi = (options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const { showSuccess, showHttpError } = useNotifications();
  const abortControllerRef = useRef(null);

  const {
    showSuccessNotification = true,
    showErrorNotification = true,
    successMessage = "",
    errorContext = "",
  } = options;

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Ejecutar una operación API
   */
  const execute = useCallback(
    async (apiCall, config = {}) => {
      // Cancelar solicitud anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Crear nuevo AbortController
      abortControllerRef.current = new AbortController();

      const {
        showLoading = true,
        onSuccess,
        onError,
        successMsg = successMessage,
        errorCtx = errorContext,
        showSuccessMsg = showSuccessNotification,
        showErrorMsg = showErrorNotification,
      } = config;

      try {
        if (showLoading) {
          setLoading(true);
        }
        setError(null);

        // Ejecutar la llamada API
        const result = await apiCall();

        // Verificar si la solicitud fue cancelada
        if (abortControllerRef.current?.signal?.aborted) {
          return null;
        }

        if (result?.success) {
          setData(result);

          // Mostrar notificación de éxito si está configurada
          if (showSuccessMsg && successMsg) {
            showSuccess(successMsg);
          }

          // Ejecutar callback de éxito
          if (onSuccess) {
            onSuccess(result);
          }

          return result;
        } else {
          // La operación falló pero se completó
          const errorResult = result?.error || "Error desconocido";
          setError(errorResult);

          if (showErrorMsg) {
            showHttpError(errorResult, errorCtx);
          }

          if (onError) {
            onError(errorResult);
          }

          return result;
        }
      } catch (err) {
        // Error de red o excepción
        if (abortControllerRef.current?.signal?.aborted) {
          return null;
        }

        const errorMsg = err.userMessage || err.message || "Error de conexión";
        setError(errorMsg);

        if (showErrorMsg) {
          showHttpError(err, errorCtx);
        }

        if (onError) {
          onError(err);
        }

        return { success: false, error: errorMsg };
      } finally {
        if (showLoading) {
          setLoading(false);
        }
        abortControllerRef.current = null;
      }
    },
    [
      showSuccessNotification,
      showErrorNotification,
      successMessage,
      errorContext,
      showSuccess,
      showHttpError,
    ]
  );

  /**
   * Resetear estados
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  /**
   * Cancelar solicitud en curso
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
    cancel,
    isLoading: loading,
    hasError: !!error,
    hasData: !!data,
  };
};

/**
 * Hook especializado para operaciones CRUD
 */
export const useCrud = (service, options = {}) => {
  const createApi = useApi({
    successMessage: "Elemento creado exitosamente",
    ...options.create,
  });

  const readApi = useApi({
    showSuccessNotification: false,
    ...options.read,
  });

  const updateApi = useApi({
    successMessage: "Elemento actualizado exitosamente",
    ...options.update,
  });

  const deleteApi = useApi({
    successMessage: "Elemento eliminado exitosamente",
    ...options.delete,
  });

  const listApi = useApi({
    showSuccessNotification: false,
    ...options.list,
  });

  // Métodos CRUD con el servicio proporcionado
  const create = useCallback(
    (data, config = {}) => {
      return createApi.execute(() => service.create(data), config);
    },
    [createApi, service]
  );

  const read = useCallback(
    (id, config = {}) => {
      return readApi.execute(() => service.getById(id), config);
    },
    [readApi, service]
  );

  const update = useCallback(
    (id, data, config = {}) => {
      return updateApi.execute(() => service.update(id, data), config);
    },
    [updateApi, service]
  );

  const remove = useCallback(
    (id, config = {}) => {
      return deleteApi.execute(() => service.delete(id), config);
    },
    [deleteApi, service]
  );

  const list = useCallback(
    (filters = {}, config = {}) => {
      return listApi.execute(() => service.getAll(filters), config);
    },
    [listApi, service]
  );

  return {
    // Estados individuales
    creating: createApi.loading,
    reading: readApi.loading,
    updating: updateApi.loading,
    deleting: deleteApi.loading,
    listing: listApi.loading,

    // Errores individuales
    createError: createApi.error,
    readError: readApi.error,
    updateError: updateApi.error,
    deleteError: deleteApi.error,
    listError: listApi.error,

    // Datos
    created: createApi.data,
    item: readApi.data,
    updated: updateApi.data,
    items: listApi.data,

    // Métodos
    create,
    read,
    update,
    remove,
    list,

    // Estado general
    loading:
      createApi.loading ||
      readApi.loading ||
      updateApi.loading ||
      deleteApi.loading ||
      listApi.loading,
    hasError:
      createApi.hasError ||
      readApi.hasError ||
      updateApi.hasError ||
      deleteApi.hasError ||
      listApi.hasError,

    // Reset individuales
    resetCreate: createApi.reset,
    resetRead: readApi.reset,
    resetUpdate: updateApi.reset,
    resetDelete: deleteApi.reset,
    resetList: listApi.reset,

    // Reset general
    resetAll: () => {
      createApi.reset();
      readApi.reset();
      updateApi.reset();
      deleteApi.reset();
      listApi.reset();
    },
  };
};

/**
 * Hook para operaciones de archivos
 */
export const useFileUpload = (options = {}) => {
  const uploadApi = useApi({
    successMessage: "Archivo subido exitosamente",
    ...options,
  });

  const upload = useCallback(
    (file, endpoint, config = {}) => {
      return uploadApi.execute(() => {
        // Aquí se usaría el método upload del httpService
        const formData = new FormData();
        formData.append("file", file);
        return fetch(endpoint, {
          method: "POST",
          body: formData,
        }).then((res) => res.json());
      }, config);
    },
    [uploadApi]
  );

  return {
    uploading: uploadApi.loading,
    uploadError: uploadApi.error,
    uploadResult: uploadApi.data,
    upload,
    reset: uploadApi.reset,
  };
};

/**
 * Hook para paginación
 */
export const usePagination = (fetchFunction, options = {}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(options.pageSize || 10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchApi = useApi({
    showSuccessNotification: false,
    ...options,
  });

  const fetchPage = useCallback(
    async (page = currentPage, size = pageSize, filters = {}) => {
      const result = await fetchApi.execute(() =>
        fetchFunction({ page, limit: size, ...filters })
      );

      if (result?.success) {
        setCurrentPage(page);
        setPageSize(size);
        setTotalItems(result.total || 0);
        setTotalPages(Math.ceil((result.total || 0) / size));
      }

      return result;
    },
    [fetchApi, fetchFunction, currentPage, pageSize]
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      fetchPage(currentPage + 1);
    }
  }, [currentPage, totalPages, fetchPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      fetchPage(currentPage - 1);
    }
  }, [currentPage, fetchPage]);

  const goToPage = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        fetchPage(page);
      }
    },
    [totalPages, fetchPage]
  );

  return {
    // Estados
    loading: fetchApi.loading,
    error: fetchApi.error,
    items: fetchApi.data?.items || fetchApi.data?.data || [],

    // Información de paginación
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,

    // Métodos
    fetchPage,
    nextPage,
    prevPage,
    goToPage,
    setPageSize: (size) => {
      setPageSize(size);
      fetchPage(1, size);
    },
    reset: fetchApi.reset,
  };
};

export default useApi;
