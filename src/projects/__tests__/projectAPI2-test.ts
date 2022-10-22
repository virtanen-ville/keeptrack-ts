//import { MOCK_PROJECTS } from "../MockProjectsOLD";
import { projectAPI } from "../projectAPI";
import { mockProjects, mockProject } from "../mockProjects";

describe("projectAPI.ts", () => {
	// Test to check if the projectAPI returns the correct data
	// ! Unit test
	test("should return records", async () => {
		const mockResponse = new Response(undefined, {
			status: 200,
			statusText: "OK",
		});
		mockResponse.json = () => Promise.resolve(mockProjects);
		jest.spyOn(window, "fetch").mockImplementation(() =>
			Promise.resolve(mockResponse)
		);

		const data = await projectAPI.get();
		expect(data).toEqual(mockProjects);
	});

	// Test to check if the projectAPI returns the correct project
	// ! Unit test
	test("should return a single record", async () => {
		const idToFind = 1;
		const responseProject = mockProjects.find(
			(project) => project.id === idToFind
		);
		const mockResponse = new Response(undefined, {
			status: 200,
			statusText: "OK",
		});
		mockResponse.json = () => Promise.resolve(responseProject);
		jest.spyOn(window, "fetch").mockImplementation(() =>
			Promise.resolve(mockResponse)
		);

		const data = await projectAPI.find(idToFind);
		return expect(data).toEqual(responseProject);
	});

	// Test to check if the projectAPI returns the right error
	// ! Unit test
	test("should return an error", async () => {
		const mockResponse = new Response(undefined, {
			status: 404,
			statusText: "Not Found",
		});
		jest.spyOn(window, "fetch").mockImplementation(() =>
			Promise.resolve(mockResponse)
		);

		try {
			return await projectAPI.get();
		} catch (error) {
			if (error instanceof Error) {
				// eslint-disable-next-line jest/no-conditional-expect
				return expect(error.message).toEqual(
					"There was an error retrieving the projects. Please try again."
				);
			}
		}
	});

	// This doesn't work because the fetch is mocked
	test("should return updated record", async () => {
		const mockResponse = new Response(undefined, {
			status: 200,
			statusText: "OK",
		});
		mockResponse.json = () => Promise.resolve(mockProject);
		jest.spyOn(window, "fetch").mockImplementation(() =>
			Promise.resolve(mockResponse)
		);

		const data = await projectAPI.put(mockProject);
		return expect(data).toEqual(mockProject);
	});
});
