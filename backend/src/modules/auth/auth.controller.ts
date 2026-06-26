import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { signAccessToken, generateRefreshToken, getRefreshTokenExpiry } from '../../lib/jwt';

const SALT_ROUNDS = 12;
const REFRESH_COOKIE = 'refresh_token';

function setRefreshCookie(res: Response, token: string, expires: Date) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires,
    path: '/api/auth',
  });
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
    });

    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const refreshToken = generateRefreshToken();
    const expiresAt = getRefreshTokenExpiry();
    await prisma.refreshToken.create({ data: { userId: user.id, token: refreshToken, expiresAt } });

    setRefreshCookie(res, refreshToken, expiresAt);
    return res.status(201).json({ user, accessToken });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const refreshToken = generateRefreshToken();
    const expiresAt = getRefreshTokenExpiry();
    await prisma.refreshToken.create({ data: { userId: user.id, token: refreshToken, expiresAt } });

    setRefreshCookie(res, refreshToken, expiresAt);
    return res.json({
      user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    const stored = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Rotate
    await prisma.refreshToken.delete({ where: { token } });
    const newRefresh = generateRefreshToken();
    const expiresAt = getRefreshTokenExpiry();
    await prisma.refreshToken.create({ data: { userId: stored.userId, token: newRefresh, expiresAt } });

    const accessToken = signAccessToken({ sub: stored.user.id, email: stored.user.email });
    setRefreshCookie(res, newRefresh, expiresAt);
    return res.json({ accessToken });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    return res.json({ message: 'Logged out' });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
    });
    return res.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: req.body,
      select: { id: true, name: true, email: true, avatarUrl: true },
    });
    return res.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    return res.json({ message: 'Password updated' });
  } catch (error) {
    next(error);
  }
}
