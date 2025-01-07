import { Button } from "react-native";
import Styles from "./Styles";
import { useContext } from "react";
import Contexts from "../../configs/Contexts";
const Logout = (navigation) => {
  const [user, dispatch] = useContext(Contexts);

  const logout = () => {
    dispatch({
      type: "logout",
    });
  };

  if (user === null)
    return (
      <Button
        title="Logout"
        style={{ padding: 3 }}
        onPress={() => navigation.navigate("Login")}
      />
    );

  return <Button title="Logout" style={{ padding: 3 }} onPress={logout} />;
};

export default Logout;
