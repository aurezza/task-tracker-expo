import { AuthRepository } from '../../../repositories/AuthRepository';
import { LoginUseCase } from '../LoginUseCase';

// Mock the repository
const mockAuthRepository = {
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  restoreSession: jest.fn(),
  getCurrentUser: jest.fn(),
} as unknown as AuthRepository;

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;

  beforeEach(() => {
    loginUseCase = new LoginUseCase(mockAuthRepository);
    jest.clearAllMocks();
  });

  it('should call login on the repository with correct credentials', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    
    (mockAuthRepository.login as jest.Mock).mockResolvedValue({ 
        success: true, 
        data: { user: { id: '1', email } } 
    });

    const result = await loginUseCase.execute(email, password);

    expect(mockAuthRepository.login).toHaveBeenCalledWith(email, password);
    expect(result.success).toBe(true);
  });

  it('should return error if email or password are missing', async () => {
    const result = await loginUseCase.execute('', 'password');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockAuthRepository.login).not.toHaveBeenCalled();
  });
});
