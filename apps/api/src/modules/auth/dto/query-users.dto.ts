import { IsOptional, IsEnum, IsString, IsDateString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum UserRoleFilter {
  ALL = 'ALL',
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
}

export enum EmailVerificationFilter {
  ALL = 'ALL',
  VERIFIED = 'VERIFIED',
  UNVERIFIED = 'UNVERIFIED',
}

export class QueryUsersDto {
  @ApiProperty({
    required: false,
    enum: UserRoleFilter,
    default: UserRoleFilter.ALL,
    description: 'Filter users by role',
  })
  @IsOptional()
  @IsEnum(UserRoleFilter)
  role?: UserRoleFilter;

  @ApiProperty({
    required: false,
    description: 'Search by name or email',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    enum: EmailVerificationFilter,
    default: EmailVerificationFilter.ALL,
    description: 'Filter by email verification status',
  })
  @IsOptional()
  @IsEnum(EmailVerificationFilter)
  emailVerified?: EmailVerificationFilter;

  @ApiProperty({
    required: false,
    description: 'Filter users created after this date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @ApiProperty({
    required: false,
    description: 'Filter users created before this date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @ApiProperty({
    required: false,
    description: 'Minimum enrollment count',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  minEnrollments?: number;

  @ApiProperty({
    required: false,
    description: 'Maximum enrollment count',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  maxEnrollments?: number;

  @ApiProperty({
    required: false,
    description: 'Minimum courses created count',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  minCoursesCreated?: number;
}
