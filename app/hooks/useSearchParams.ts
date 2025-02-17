import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';

export function useSearchParams<T extends Record<string, string>>(
  defaultParams: T
): [T, (params: Partial<T>) => void] {
  const location = useLocation();
  const navigate = useNavigate();

  const [params, setParams] = useState<T>(() => {
    const urlParams = new URLSearchParams(location.search);
    for (const key of urlParams.keys()) {
      if (defaultParams[key]) {
        urlParams.set(key, defaultParams[key]);
      }
    }
    return Object.fromEntries(urlParams.entries()) as T;
  });

  console.log('paramsins', params);

  // Sync URL with state, but only when params change
  useEffect(() => {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      // Only add params that differ from defaults or are explicitly set
      if (
        value &&
        (value !== defaultParams[key] ||
          new URLSearchParams(location.search).has(key))
      ) {
        urlParams.set(key, value);
      }
    });

    const search = urlParams.toString();
    const newUrl = search ? `?${search}` : location.pathname;

    if (newUrl !== location.pathname + location.search) {
      navigate(newUrl, { replace: true });
    }
  }, [params, navigate, location.pathname, location.search, defaultParams]);

  const updateParams = useCallback((newParams: Partial<T>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  return [params, updateParams];
}
