import { useContext, Dispatch } from 'react';

import { LayoutContext, LayoutDispatchContext, type LayoutType, type LayoutAction } from '.';

type UseLayoutHook = () => [LayoutType, Dispatch<LayoutAction>];

export const useLayout: UseLayoutHook = () => {
    const layout = useContext(LayoutContext);
    const layoutDispatch = useContext(LayoutDispatchContext);

    return [layout as LayoutType, layoutDispatch as Dispatch<LayoutAction>];
};
