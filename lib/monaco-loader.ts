export const localMonacoVsPath = "/monaco/vs";

interface MonacoLoaderLike {
  config: (value: { paths: { vs: string } }) => void;
}

export function configureMonacoLoader(monacoLoader: MonacoLoaderLike) {
  monacoLoader.config({
    paths: {
      vs: localMonacoVsPath,
    },
  });

  return monacoLoader;
}
