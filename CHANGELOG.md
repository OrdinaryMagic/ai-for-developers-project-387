# Changelog

## [1.4.0](https://github.com/OrdinaryMagic/ai-for-developers-project-387/compare/v1.3.0...v1.4.0) (2026-11-13)


### Features

* **ci:** switch /oc slash commands to LiteLLM proxy with MiniMax models ([902d6bc](https://github.com/OrdinaryMagic/ai-for-developers-project-387/commit/902d6bc12baf80b042933a6aa201492d8bd7083d))


### Bug Fixes

* **ci:** default /oc model to free opencode/glm-5.3-flash-free ([5b12d80](https://github.com/OrdinaryMagic/ai-for-developers-project-387/commit/5b12d80d0bbd2ff6e86fafe63a7baa57616c3021))
* **ci:** remove API_KEY env name from opencode config ([bda6ffb](https://github.com/OrdinaryMagic/ai-for-developers-project-387/commit/bda6ffb7e2cab7c2508886ec56625366cd07e560))
* **ci:** remove invalid reactions permission from opencode workflow ([b6afa77](https://github.com/OrdinaryMagic/ai-for-developers-project-387/commit/b6afa77712a6605321e17f7ff53e79e0085112bc))
* **ci:** restore issues and pull-requests read permissions ([687ecf7](https://github.com/OrdinaryMagic/ai-for-developers-project-387/commit/687ecf7519617663ae37188edef260ee9475b72e))
* **ci:** use V1 provider format for LiteLLM MiniMax models ([b319434](https://github.com/OrdinaryMagic/ai-for-developers-project-387/commit/b319434d12ea86e8519dddb4d29334f4c7018140))

## [1.3.0](https://github.com/OrdinaryMagic/ai-for-developers-project-386/compare/v1.2.0...v1.3.0) (2026-11-06)


### Features

* project gate, generated SDK и booking UX ([#82](https://github.com/OrdinaryMagic/ai-for-developers-project-386/issues/82)) ([f1c31d7](https://github.com/OrdinaryMagic/ai-for-developers-project-386/commit/f1c31d7aa9163a8c38ddba613f7bbcba19080e49))

## [1.2.0](https://github.com/OrdinaryMagic/ai-for-developers-project-386/compare/v1.1.0...v1.2.0) (2026-11-04)


### Features

* **web:** ссылки на доступные страницы в шапке SPA ([#72](https://github.com/OrdinaryMagic/ai-for-developers-project-386/issues/72)) ([#73](https://github.com/OrdinaryMagic/ai-for-developers-project-386/issues/73)) ([743c520](https://github.com/OrdinaryMagic/ai-for-developers-project-386/commit/743c520a712c536ad9ec532399a235914416a0af))
* **web:** страница «не найдено» для неизвестных маршрутов SPA ([#68](https://github.com/OrdinaryMagic/ai-for-developers-project-386/issues/68)) ([#70](https://github.com/OrdinaryMagic/ai-for-developers-project-386/issues/70)) ([2f2d01f](https://github.com/OrdinaryMagic/ai-for-developers-project-386/commit/2f2d01feb63bd8bc3355dd7ce7f612dbe9089f44))


### Bug Fixes

* **bookings:** слоты, которые уже начались, не бронируются ([#74](https://github.com/OrdinaryMagic/ai-for-developers-project-386/issues/74)) ([3898485](https://github.com/OrdinaryMagic/ai-for-developers-project-386/commit/389848521d13162cc4f6f696e51b383c54f08d1d))

## [1.1.0](https://github.com/OrdinaryMagic/ai-for-developers-project-386/compare/v1.0.0...v1.1.0) (2026-11-03)


### Features

* cart [#26](https://github.com/OrdinaryMagic/ai-for-developers-project-386/issues/26) — UI & E2E (сквозной браузерный сценарий через Playwright против реального Fastify) ([#38](https://github.com/OrdinaryMagic/ai-for-developers-project-386/issues/38)) ([81cfabf](https://github.com/OrdinaryMagic/ai-for-developers-project-386/commit/81cfabfbddbbf7387a5d442bb4fd40365a4f49a2))

## 1.0.0 (2026-11-03)


### Features

* **backend:** добавить BookingStore с конкурентностью и маршруты bookings + availability ([aca961d](https://github.com/OrdinaryMagic/ai-for-developers-project-386/commit/aca961dbaa314e97c215ed80cacd98d63265562d))
* **backend:** добавить MeetingTypeStore и CRUD-маршруты /meeting-types ([35a8353](https://github.com/OrdinaryMagic/ai-for-developers-project-386/commit/35a8353543193212b5f21b7f57fa3268dad73fa3))
* **backend:** добавить фундамент и GET /config (time-domain, owner config, domain errors) ([9b249f3](https://github.com/OrdinaryMagic/ai-for-developers-project-386/commit/9b249f3b9197e1cbc46ea8ec95176e8027c8f84d))
* Booking API v1 (slice 01 of N) ([#23](https://github.com/OrdinaryMagic/ai-for-developers-project-386/issues/23)) ([f42c955](https://github.com/OrdinaryMagic/ai-for-developers-project-386/commit/f42c9554e13837649b00de43b3ca1c865809d4f2))
* ga ([dffff61](https://github.com/OrdinaryMagic/ai-for-developers-project-386/commit/dffff61fdf15f17a9d819ad39d684a3f2086f5a5))
* **spec:** ввести TypeSpec-конвейер и базовый контракт v1 ([95082f3](https://github.com/OrdinaryMagic/ai-for-developers-project-386/commit/95082f3c5f20bfc2f9f449c26d8a0e76d9b37f86))
* настройка проекта ([9abea54](https://github.com/OrdinaryMagic/ai-for-developers-project-386/commit/9abea543653ec1b3e795d3a2be3578849c5ade64))


### Bug Fixes

* **backend:** code-review фиксы — email/ISO форматы, убран лишний slotStepMinutes, тесты асимметрии ([4a639ae](https://github.com/OrdinaryMagic/ai-for-developers-project-386/commit/4a639aea1a83406fde312a6bd3a958315a1b63fc))
