import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "../../state";
import ProjectsPage from "../ProjectsPage";
import {
	render,
	screen,
	waitForElementToBeRemoved,
} from "@testing-library/react";

import { rest } from "msw";
import { setupServer } from "msw/node";

import { mockProjects } from "../mockProjects";

// We mock a server with msw and return a mocked response taht has the projects as JSON. This server get function is called at the useEffect hook in ProjectsPage.tsx
const server = setupServer(
	rest.get("http://localhost:4000/projects", (req, res, ctx) => {
		return res(ctx.json(mockProjects));
	})
);

describe("<ProjectsPage />", () => {
	const setup = () => {
		render(
			<Provider store={store}>
				{/* We need MemoryRouter from React Router to render Router elements (such as Link) */}
				<MemoryRouter>
					<ProjectsPage />
				</MemoryRouter>
			</Provider>
		);
	};

	// We start the server before the tests and close it after the tests. In between we can reset the handlers if we need to.
	beforeAll(() => server.listen());
	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	test("should render the component without crashing", () => {
		setup();
	});

	// We test that the loading text is displayed when the component is rendered (and data is not yet fetched)
	// ! Unit test
	test("should show 'loading' text when loading data", () => {
		setup();
		const loadingText = screen.getByText(/loading/i);
		expect(loadingText).toBeInTheDocument();
	});

	// Test that the projects title is displayed when the data is fetched (after loading text is removed)
	// ! Unit test
	test("should show Projects title", async () => {
		setup();
		await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

		expect(screen.getByText("Projects")).toBeInTheDocument();
	});

	// We test that the projects are displayed when the data is fetched. This is already an integration test, but this component itself has pretty much nothing to test.
	// ! Integration test
	test("should show right amount of projects", async () => {
		setup();
		expect(await screen.findAllByRole("img")).toHaveLength(
			mockProjects.length
		);
	});

	// Test for showing more button
	// ! Unit test
	test("should show a 'more' button", async () => {
		setup();
		expect(
			await screen.findByRole("button", { name: /more/i })
		).toBeInTheDocument();
	});

	// Test the error message when the server returns an error
	// ! Integration test
	test("should show correct errors on server error", async () => {
		let testCases = [
			{ status: 401, message: "Please login again." },
			{
				status: 403,
				message: "You do not have permission to view the project(s).",
			},
			{
				status: 500,
				message:
					"There was an error retrieving the project(s). Please try again.",
			},
		];

		testCases.forEach(async (testCase) => {
			server.use(
				rest.get("http://localhost:4000/projects", (req, res, ctx) => {
					return res(ctx.status(testCase.status, testCase.message));
				})
			);
			setup();

			const regex = new RegExp(testCase.message, "i");
			expect(await screen.findByText(regex)).toBeInTheDocument();
		});
	});
});
