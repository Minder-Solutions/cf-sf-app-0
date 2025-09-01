import {Spinner} from '@shopify/polaris';

export function LoadingIndicator() {
  return (
<div className="LoadingIndicator">
  <Spinner accessibilityLabel="Loading" size="large" />
</div>
  );
}