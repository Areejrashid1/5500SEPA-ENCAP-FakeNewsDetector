<?php

require_once __DIR__ . '/../repositories/UserRepository.php';

class AuthController
{
    private UserRepository $users;

    public function __construct()
    {
        $this->users = new UserRepository();
    }

    public function register(array $data): array
    {
        $name = trim($data['name'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if ($name === '' || $email === '' || $password === '') {
            http_response_code(400);
            return ['error' => 'Name, email and password are required.'];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            return ['error' => 'Invalid email address.'];
        }

        if ($this->users->findByEmail($email)) {
            http_response_code(409);
            return ['error' => 'User with this email already exists.'];
        }

        $user = new User();
        $user->name = $name;
        $user->email = $email;
        $user->password = password_hash($password, PASSWORD_DEFAULT);
        $user->created_at = date('Y-m-d H:i:s');

        $user = $this->users->create($user);

        // Simple token stub
        // Store user in session
$_SESSION['user_id'] = $user->user_id;
$_SESSION['name']    = $user->name;
$_SESSION['email']   = $user->email;

return [
    'user_id' => $user->user_id,
    'name'    => $user->name,
    'email'   => $user->email,
];
    }

    public function login(array $data): array
    {
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if ($email === '' || $password === '') {
            http_response_code(400);
            return ['error' => 'Email and password are required.'];
        }

        $user = $this->users->findByEmail($email);
        if (!$user || !password_verify($password, $user->password)) {
            http_response_code(401);
            return ['error' => 'Invalid credentials.'];
        }

        // In a real system, generate JWT or session. Here we return a stub.
        return [
            'user_id' => $user->user_id,
            'name' => $user->name,
            'email' => $user->email,
        ];
    }
}

