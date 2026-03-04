export const saveSession = (address, chainId) => {
  const sessionData = {
    address: address,
    chainId: chainId.toString()
  };
  sessionStorage.setItem("user_session", JSON.stringify(sessionData));
};


export const getSession = () => {
  const data = sessionStorage.getItem("user_session");
  return data ? JSON.parse(data) : null;
};