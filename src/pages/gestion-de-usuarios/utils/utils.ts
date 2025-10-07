import type { UserType } from "@/api/interface/user";

export const transformUserType = (usertype:UserType) => {
  switch (usertype) {
    case "admin":
      return "Administrador"
    case  "temporal":
      return "Temporal"
    case "guest":
      return "Invitado"
    case "final":
      return "Final"
    default:
      return "Final"
  } 
    
  
   
  

};
