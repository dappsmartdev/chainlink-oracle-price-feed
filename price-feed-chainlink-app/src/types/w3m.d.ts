declare global {
  namespace JSX {
    interface IntrinsicElements {
      'w3m-button': {
        label?: string;
        balance?: 'show' | 'hide';
        loadingLabel?: string;
        style?: React.CSSProperties;
        class?: string;
      };
    }
  }
}