import { useOutletContext } from "react-router-dom";

type LayoutContext = {
  search: string;
  setSearch: (value: string) => void;
};

export function useLayoutSearch(): LayoutContext {
  return useOutletContext<LayoutContext>();
}
