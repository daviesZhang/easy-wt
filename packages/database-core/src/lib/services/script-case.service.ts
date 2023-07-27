import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, TreeRepository } from 'typeorm';
import { IScriptCase, ScriptCase } from '@easy-wt/common';
import { ScriptCaseEntity, StepEntity } from '../entitys';

@Injectable()
export class ScriptCaseService {
  logger = new Logger('ScriptCaseService');

  constructor(
    @InjectRepository(ScriptCaseEntity)
    private caseTreeRepository: TreeRepository<ScriptCase>,
    private dataSource: DataSource
  ) {}

  findAll(): Promise<IScriptCase[]> {
    return this.caseTreeRepository.find();
  }

  findById(id: number): Promise<IScriptCase> {
    return this.caseTreeRepository.findOne({
      where: { id: id },
      relations: ['runConfig'],
    });
  }

  /**
   * 查找所有非目录的下级
   * @param id
   */
  async findCasesById(id: number): Promise<IScriptCase[]> {
    const entity = new ScriptCaseEntity();
    return this.caseTreeRepository
      .createDescendantsQueryBuilder('category', 'categoryClosure', entity)
      .andWhere(`categoryClosure.id_ancestor= :id`, { id: id })
      .andWhere(`category.directory= :directory`, { directory: false })
      .leftJoinAndSelect('category.steps', 'steps')
      .getMany();
  }

  /**
   * 找到直接所有子节点
   * @param id 节点ID
   */
  async findDescendantsById(id: number): Promise<IScriptCase[]> {
    return await this.caseTreeRepository.findBy({ parentId: id });
  }

  update(id: number, data: IScriptCase): Promise<string> {
    return this.caseTreeRepository.update(id, data).then((next) => next.raw);
  }

  async findTrees(): Promise<IScriptCase[]> {
    return await this.caseTreeRepository.findTrees();
  }

  findRoots(): Promise<IScriptCase[]> {
    return this.caseTreeRepository.findRoots();
  }

  /**
   * 根据ID找到用例,并且找到他的所有上级,返回tree
   * @param id
   * @param relations 需要关联的表
   */
  async findAncestorsTree(id: number): Promise<IScriptCase> {
    const categoryEntity = await this.caseTreeRepository.findOne({
      where: { id },
      relations: ['runConfig', 'steps'],
    });
    return this.caseTreeRepository.findAncestorsTree(categoryEntity, {
      relations: ['runConfig'],
    });
  }

  async copyCase(id: number) {
    const categoryEntity = await this.caseTreeRepository.findOne({
      where: { id },
      relations: ['runConfig', 'steps'],
    });

    const tree = await this.caseTreeRepository.findDescendantsTree(
      categoryEntity,
      { relations: ['runConfig', 'steps'] }
    );

    const saved = await this.dataSource.transaction(async (manager) => {
      async function saveRoot(node: ScriptCase, parentId: number) {
        const newNode = Object.assign({}, node, {
          id: null,
          parent: typeof parentId === 'number' ? { id: parentId } : null,
          parentId: parentId,
          children: [],
          steps: [],
          name: `${node.name} copy`,
        }) as ScriptCaseEntity;
        if (node.runConfig) {
          newNode.runConfig = Object.assign({}, node.runConfig, {
            id: null,
            caseId: null,
          });
        }
        const saved = await manager.save(ScriptCaseEntity, newNode);
        if (node.steps && node.steps.length) {
          const steps = node.steps.map((step) => {
            return Object.assign({}, step, { caseId: saved.id, id: null });
          });
          await manager.save(StepEntity, steps);
        }

        if (node.children && node.children.length) {
          await saveChildren(node.children, saved.id);
        }
        return saved;
      }

      async function saveChildren(
        nodes: ScriptCase[],
        parentId: number
      ): Promise<void> {
        for (const node of nodes) {
          await saveRoot(node, parentId);
        }
      }

      return await saveRoot(tree, tree.parentId);
    });

    return this.caseTreeRepository.findDescendantsTree(saved);
  }

  save(scriptCase: IScriptCase): Promise<IScriptCase> {
    return this.caseTreeRepository.save(scriptCase);
  }

  /**
   * 返回被删除的ID列表
   * @param id
   */
  async delete(id: number): Promise<number[]> {
    const list = await this.caseTreeRepository.findDescendants({
      id,
    } as ScriptCase);
    await this.caseTreeRepository.delete({ id });
    return list.map((item) => item.id);
  }
}
