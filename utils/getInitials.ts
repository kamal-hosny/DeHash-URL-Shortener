  // Get initials from name 
  
export const getInitials = (name?: string) => {
    if(name) {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
    }
    return "U";
}