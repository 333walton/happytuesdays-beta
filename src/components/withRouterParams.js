import { useParams } from "react-router-dom";

export function withRouterParams(WrappedComponent) {
  return function Wrapper(props) {
    const params = useParams();
    return <WrappedComponent {...props} routerParams={params} />;
  };
}
