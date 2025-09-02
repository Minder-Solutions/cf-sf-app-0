import { useNavigation } from '@remix-run/react';
import {Spinner} from '@shopify/polaris';

export function LoadingIndicator() {
  const navigation = useNavigation();
  const isLoading = navigation.state !== "idle";
  
  if(!isLoading) return <></>;

  return (
<div className="LoadingIndicator">
  <Spinner accessibilityLabel="Loading" size="large" />
</div>
  );
}