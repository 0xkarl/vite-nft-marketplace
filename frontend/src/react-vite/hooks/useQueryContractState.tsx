import { useEffect, useState } from 'react';
import * as vite from '@vite/vitejs';
import { WS_RPC } from '@vite/vitejs-ws';

import { Fragment } from '../types';

export function useQueryContractState<T>(
  provider: typeof WS_RPC,
  contractAddress: string,
  abi: Fragment[],
  methodName: string,
  params: any[],
  filterEvents?: any[]
) {
  const [value, setValue] = useState<T | null>(null);

  useEffect(() => {
    let isMounted = true;
    const unsubs = [
      () => {
        isMounted = false;
      },
    ];

    const load = async () => {
      const ret = (await provider.queryContractState({
        address: contractAddress,
        abi,
        methodName,
        params,
      })) as T | null;
      if (isMounted) {
        setValue(ret);
      }
    };

    const subscribe = async () => {
      if (filterEvents) {
        const fragments = abi.filter(
          (fragment: Fragment) =>
            !fragment.anonymous &&
            !!~filterEvents.indexOf(fragment.name) &&
            fragment.type === 'event'
        );
        const filterParams = {
          addressHeightRange: {
            [contractAddress]: {
              fromHeight: '0',
              toHeight: '0',
            },
          },
          topics: [fragments.map((f) => vite.abi.encodeLogSignature(f))],
        };
        try {
          const event = await provider.subscribe(
            'createVmlogSubscription',
            filterParams
          );
          event.on(() => {
            load();
          });

          unsubs.push(() => {
            provider.unsubscribe(event);
          });
        } catch (e) {
          console.warn(e);
        }
      }
    };

    load();
    subscribe();

    return () => unsubs.forEach((unsub) => unsub());
  }, [provider, contractAddress, abi, methodName, params, filterEvents]);

  return value;
}
