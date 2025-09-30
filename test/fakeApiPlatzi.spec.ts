import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { faker } from '@faker-js/faker';

describe('Platzi Fake Store API - Testes com Produtos', () => {
  const baseUrl = 'https://api.escuelajs.co/api/v1';
  const p = pactum;
  p.request.setDefaultTimeout(10000);

  let createdProductId: number;
  let existingProductId: number;

  // 1) GET lista de produtos e pega um ID existente
  it('GET /products -> deve retornar lista de produtos', async () => {
    const res = await p.spec()
      .get(`${baseUrl}/products`)
      .expectStatus(StatusCodes.OK)
      .returns('res.body');

    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeGreaterThan(0);

    existingProductId = res[0].id;
  });

  // 2) GET produto por ID (válido)
  it('GET /products/:id -> retorna produto específico', async () => {
    await p.spec()
      .get(`${baseUrl}/products/${existingProductId}`)
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({ id: existingProductId });
  });

  // 3) POST novo produto
  it('POST /products -> cria novo produto', async () => {
    const product = {
      title: faker.commerce.productName(),
      price: Number(faker.commerce.price()),
      description: faker.commerce.productDescription(),
      categoryId: 1,
      images: [faker.image.url()]
    };

    const res = await p.spec()
      .post(`${baseUrl}/products`)
      .withJson(product)
      .expectStatus(StatusCodes.CREATED)
      .returns('res.body');

    createdProductId = res.id;
    expect(createdProductId).toBeDefined();
  });

  // 4) PUT atualizar produto
  it('PUT /products/:id -> atualiza produto inteiro', async () => {
    const updated = {
      title: 'Produto Atualizado',
      price: 99.99,
      description: 'Descrição atualizada',
      categoryId: 1,
      images: ['https://placeimg.com/640/480/tech']
    };

    await p.spec()
      .put(`${baseUrl}/products/${createdProductId}`)
      .withJson(updated)
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({ title: 'Produto Atualizado' });
  });

  // 5) DELETE produto criado
  it('DELETE /products/:id -> deleta produto', async () => {
    await p.spec()
      .delete(`${baseUrl}/products/${createdProductId}`)
      .expectStatus(StatusCodes.OK);
  });

  // 6) GET produto com ID inexistente
  it('GET /products/:id -> erro com ID inexistente', async () => {
    await p.spec()
      .get(`${baseUrl}/products/999999`)
      .expectStatus(StatusCodes.BAD_REQUEST);
  });

  // 7) POST com dados inválidos
  it('POST /products -> falha com dados incompletos', async () => {
    const invalidProduct = {
      price: 123
    };

    await p.spec()
      .post(`${baseUrl}/products`)
      .withJson(invalidProduct)
      .expectStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  // 8) GET categorias
  it('GET /categories -> retorna categorias', async () => {
    const res = await p.spec()
      .get(`${baseUrl}/categories`)
      .expectStatus(StatusCodes.OK)
      .returns('res.body');

    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeGreaterThan(0);
  });

  // 9) GET produtos por categoria
  it('GET /categories/:id/products -> produtos por categoria', async () => {
    const res = await p.spec()
      .get(`${baseUrl}/categories/1/products`)
      .expectStatus(StatusCodes.OK)
      .returns('res.body');

    expect(Array.isArray(res)).toBe(true);
  });

  // 10) POST criar usuário
  it('POST /users -> cria novo usuário', async () => {
    const user = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: '123456',
      avatar: faker.image.avatar()
    };

    const res = await p.spec()
      .post(`${baseUrl}/users`)
      .withJson(user)
      .expectStatus(StatusCodes.CREATED)
      .returns('res.body');

    expect(res.email).toBe(user.email);
  });

  // 11) POST login com usuário existente
  it('POST /auth/login -> login com usuário conhecido', async () => {
    const login = {
      email: 'john@mail.com',
      password: 'changeme'
    };

    const res = await p.spec()
      .post(`${baseUrl}/auth/login`)
      .withJson(login)
      .expectStatus(StatusCodes.CREATED)
      .returns('res.body');

    expect(res.access_token).toBeDefined();
  });
});
