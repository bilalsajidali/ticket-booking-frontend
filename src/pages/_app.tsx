// src/pages/_app.tsx
import { AppProps } from 'next/app';  // Import the correct types from next/app
import '../styles/globals.css';  // Adjust the path if necessary

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
