import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const UserTypeSelector = ({ setUserType, userType, onClickHandler }: UserTypeSelectorParams) => {
  const accessChangeHandler = (type: UserType) => {
    setUserType(type)
    onClickHandler?.(type)
  }

  return (
      <Select value={userType} onValueChange={(type: UserType) => accessChangeHandler(type)}>
        <SelectTrigger className="shad-select">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-none bg-dark-200">
          <SelectItem value="viewer" className="shad-select-item">can view</SelectItem>
          <SelectItem value="editor" className="shad-select-item">can edit</SelectItem>
        </SelectContent>
      </Select>
  )
}
export default UserTypeSelector