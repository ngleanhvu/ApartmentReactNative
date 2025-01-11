import { List } from "react-native-paper";
import { TouchableOpacity, Image } from "react-native";
import Styles from ".Styles";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";

const Item = ({ item, routeName, params }) => {
  const nav = useNavigation();

  return (
    <List.Item
      key={item.id}
      title={item.subject}
      description={item.created_date && moment(item.created_date).fromNow()}
      left={(props) => (
        <TouchableOpacity onPress={() => nav.navigate(routeName, params)}>
          <Image source={{ uri: item.image }} style={Styles.box} />
        </TouchableOpacity>
      )}
    />
  );
};

<View key={item.id} style={Styles.transactionItem}>
  <TouchableOpacity
    onPress={() =>
      navigation.navigate("Monthly fee detail", { transactionId: item.id })
    }
  >
    <Text style={Styles.transactionDescription}>{item.description}</Text>
    <Text style={Styles.transactionAmount}>
      Tổng tiền: {item.amount.toLocaleString("vi-VN")} VNĐ
    </Text>
    <Text style={Styles.transactionDate}>
      Thanh toán: {moment(item.created_date).fromNow()}
    </Text>
  </TouchableOpacity>
</View>;

export default Item;
