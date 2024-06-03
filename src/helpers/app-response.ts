export const AppResponse = (
  data: any | null,
  message: string,
  success: boolean,
) => {
  return {
    data,
    message,
    success,
  };
};
