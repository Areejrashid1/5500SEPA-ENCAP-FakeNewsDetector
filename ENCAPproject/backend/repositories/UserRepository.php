<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';

class UserRepository
{
    private $conn;

    public function __construct()
{
    $this->conn = Database::getConnection(); // ← static call, correct method name
}

    public function findByEmail(string $email): ?User
    {
        $stmt = $this->conn->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return $this->mapRowToUser($row);
    }

    public function create(User $user): User
{
    $query = "INSERT INTO users (name, email, password)
              VALUES (:name, :email, :password)";

    $stmt = $this->conn->prepare($query);

    $stmt->bindParam(':name', $user->name);
    $stmt->bindParam(':email', $user->email);
    $stmt->bindParam(':password', $user->password);

    $stmt->execute();

    $user->user_id = $this->conn->lastInsertId();

    return $user;
}

    private function mapRowToUser(array $row): User
    {
        $user = new User();
        $user->user_id = (int)$row['user_id'];
        $user->name = $row['name'];
        $user->email = $row['email'];
        $user->password = $row['password'];
        $user->created_at = $row['created_at'];

        return $user;
    }
}