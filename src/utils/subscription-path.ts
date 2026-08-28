export function isSubscriptionPath(pathname: string = window.location.pathname): boolean {
  return pathname.startsWith('/subscription');
}
