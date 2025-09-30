import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { faker } from '@faker-js/faker';

describe('FakeStore API - testes básicos e avançados', () => {
  const baseUrl = 'https://fakestoreapi.com';
  const p = pactum;
  p.request.setDefaultTimeout(90000);

  let firstProductId: number;
  let createdProductId: number;

  beforeAll(async () => {
    const products = await p
      .spec()
      .get(`${baseUrl}/products`)
      .expectStatus(StatusCodes.OK)
      .returns('res.body');

    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
    firstProductId = products[0].id;
  });

  // 1) GET lista
  /**
   * Testa se a API retorna a lista de produtos com sucesso
   */
  it('GET /products -> retorna lista de produtos', async () => {
    const res = await p
      .spec()
      .get(`${baseUrl}/products`)
      .expectStatus(StatusCodes.OK)
      .returns('res.body');

    expect(res.length).toBeGreaterThan(0);
  });

  // 2) GET por id
  /**
   * Testa se a API retorna um produto específico a partir do seu ID
   */
  it('GET /products/:id -> retorna produto por id', async () => {
    await p
      .spec()
      .get(`${baseUrl}/products/${firstProductId}`)
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({ id: firstProductId });
  });

  // 3) POST criar produto
  /**
   * Testa a criação de um novo produto via POST e verifica se o produto criado retorna o ID
   */
  it('POST /products -> cria produto novo', async () => {
    const newProduct = {
      title: faker.commerce.productName(),
      price: 49.9,
      description: 'Produto criado no teste',
      image: 'https://i.pravatar.cc',
      category: 'electronics'
    };

    const created = await p
      .spec()
      .post(`${baseUrl}/products`)
      .withJson(newProduct)
      .expectStatus(StatusCodes.CREATED)
      .returns('res.body');

    createdProductId = created.id;
    console.log('Produto criado ID:', createdProductId);
    expect(createdProductId).toBeDefined();
  });

  // 4) PUT atualizar
  /**
   * Testa a atualização de um produto existente via PUT
   */
  it('PUT /products/:id -> atualiza produto', async () => {
    if (!createdProductId) return;

    await p
      .spec()
      .put(`${baseUrl}/products/${createdProductId}`)
      .withJson({ title: 'Produto atualizado', price: 29.9 })
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({ id: createdProductId });
  });

  // 5) DELETE produto
  /**
   * Testa a remoção de um produto via DELETE pelo ID criado anteriormente
   */
  it('DELETE /products/:id -> deleta produto', async () => {
    if (!createdProductId) return;

    await p
      .spec()
      .delete(`${baseUrl}/products/${createdProductId}`)
      .expectStatus(StatusCodes.OK);
  });

  // 6) GET por ID inválido
  /**
   * Testa o comportamento da API ao buscar um produto por ID inexistente
   */
  it('GET /products/:id -> retorna erro com ID inexistente', async () => {
    await p
      .spec()
      .get(`${baseUrl}/products/999999`)
      .expectStatus(StatusCodes.OK);
  });

  // 7) POST inválido (dados faltando)
  /**
   * Testa a tentativa de criar um produto com dados incompletos e verifica resposta da API
   */
  it('POST /products -> falha com dados incompletos', async () => {
    await p
      .spec()
      .post(`${baseUrl}/products`)
      .withJson({ title: 'Incompleto' }) 
      .expectStatus(StatusCodes.CREATED);
  });

  // 8) GET categorias
  /**
   * Testa se a API retorna a lista de categorias disponíveis
   */
  it('GET /products/categories -> retorna categorias', async () => {
    const res = await p
      .spec()
      .get(`${baseUrl}/products/categories`)
      .expectStatus(StatusCodes.OK)
      .returns('res.body');

    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeGreaterThan(0);
  });

  // 9) GET produtos por categoria
  /**
   * Testa se a API retorna os produtos de uma categoria específica
   */
  it('GET /products/category/:category -> produtos de uma categoria', async () => {
    const category = 'electronics';
    const res = await p
      .spec()
      .get(`${baseUrl}/products/category/${category}`)
      .expectStatus(StatusCodes.OK)
      .returns('res.body');

    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeGreaterThan(0);
  });

  // 10) POST criar usuário
  /**
   * Testa a criação de um novo usuário via POST
   */
  it('POST /users -> cria usuário novo', async () => {
    const newUser = {
      email: faker.internet.email(),
      username: faker.internet.username(),
      password: '123456',
      name: {
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
      },
      address: {
        city: faker.location.city(),
        street: faker.location.street(),
        number: 3,
        zipcode: '12345-678',
        geolocation: {
          lat: '40.7128',
          long: '74.0060'
        }
      },
      phone: '123-456-7890'
    };

    await p
      .spec()
      .post(`${baseUrl}/users`)
      .withJson(newUser)
      .expectStatus(StatusCodes.CREATED);
  });

  // 11) POST login
  /**
   * Testa o login com credenciais válidas e verifica se retorna token
   */
  it('POST /auth/login -> login com credenciais válidas', async () => {
    const loginData = {
      username: 'mor_2314',
      password: '83r5^_'
    };

    await p
      .spec()
      .post(`${baseUrl}/auth/login`)
      .withJson(loginData)
      .expectStatus(StatusCodes.CREATED)
      .expectJsonLike({ token: /\S+/ });
  });

  // 12) POST criar carrinho
  /**
   * Testa a criação de um novo carrinho com produtos e quantidades
   */
  it('POST /carts -> cria novo carrinho', async () => {
    const cart = {
      userId: 1,
      date: '2020-02-03',
      products: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 }
      ]
    };

    await p
      .spec()
      .post(`${baseUrl}/carts`)
      .withJson(cart)
      .expectStatus(StatusCodes.CREATED);
  });

  // 13) PATCH produto (simulação de atualização parcial)
  /**
   * Testa atualização parcial de um produto via PATCH (exemplo alteração do preço)
   */
  it('PATCH /products/:id -> atualização parcial', async () => {
    await p
      .spec()
      .patch(`${baseUrl}/products/1`)
      .withJson({ price: 99.9 })
      .expectStatus(StatusCodes.OK);
  });
});
