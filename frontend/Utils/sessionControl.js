export const saveSession = (address, chainId) => {
  if (typeof window !== "undefined") {
  const sessionData = {
    address: address,
    chainId: chainId.toString()
  };
  sessionStorage.setItem("user_session", JSON.stringify(sessionData));
}
};


export const getSession = () => {
  if (typeof window !== "undefined") {
  const data = sessionStorage.getItem("user_session");
  return data ? JSON.parse(data) : null;
  }
  return null;
};