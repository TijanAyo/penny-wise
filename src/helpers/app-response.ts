export const AppResponse = (
  data: any | null,
  message: string,
  success: boolean = true,
) => {
  return {
    data,
    message,
    success,
  };
};
