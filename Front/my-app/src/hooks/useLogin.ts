import { useAuth } from "@/components/AuthContext";
import { loginUserService } from "@/services/userServices";
import { ILoginDTO } from "@/interfaces/userInterface";

export const useLogin = () => {
  const { login } = useAuth();

  const loginUser = async (data: ILoginDTO) => {
    const { user, token } = await loginUserService(data);
    login(user, token);
    return { user, token };
  };
  return { loginUser };
};
