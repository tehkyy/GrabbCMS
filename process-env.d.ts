declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      REACT_APP_PORT: string;
      // add more environment variables and their types here
    }
  }
}