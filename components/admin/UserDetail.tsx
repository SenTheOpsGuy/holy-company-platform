interface UserDetailProps {
  user: any;
}

export default function UserDetail({ user }: UserDetailProps) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User Details</h2>
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
        <p><strong>Punya Balance:</strong> {user.punyaBalance}</p>
        <p><strong>Current Streak:</strong> {user.currentStreak}</p>
      </div>
    </div>
  );
}