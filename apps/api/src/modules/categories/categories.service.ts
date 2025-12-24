import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.courseCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.courseCategory.findUnique({
      where: { id },
      include: {
        courses: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            slug: true,
            shortDescription: true,
            thumbnailUrl: true,
            isPremium: true,
            priceCents: true,
            difficultyLevel: true,
            instructor: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.courseCategory.findUnique({
      where: { slug },
      include: {
        courses: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            slug: true,
            shortDescription: true,
            thumbnailUrl: true,
            isPremium: true,
            priceCents: true,
            difficultyLevel: true,
            instructor: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    // Get the max sortOrder and add 1
    const maxSortOrder = await this.prisma.courseCategory.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const slug = createCategoryDto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return this.prisma.courseCategory.create({
      data: {
        ...createCategoryDto,
        slug,
        sortOrder: (maxSortOrder?.sortOrder || 0) + 1,
      },
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.courseCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const updateData: any = { ...updateCategoryDto };

    // Regenerate slug if name is being updated
    if (updateCategoryDto.name) {
      updateData.slug = updateCategoryDto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    return this.prisma.courseCategory.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    const category = await this.prisma.courseCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Don't allow deletion if category has courses
    if (category._count.courses > 0) {
      throw new NotFoundException(
        'Cannot delete category with associated courses'
      );
    }

    await this.prisma.courseCategory.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }

  async reorder(categoryIds: string[]) {
    // Update sortOrder for each category
    await this.prisma.$transaction(
      categoryIds.map((id, index) =>
        this.prisma.courseCategory.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    return { message: 'Categories reordered successfully' };
  }
}
